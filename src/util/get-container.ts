import Docker from 'dockerode';
import { execa } from 'execa';
import getPort from 'get-port';
import { merge } from "ts-deepmerge";
import { Config } from 'arangojs/connection';

const DEFAULT_DB_IMAGE = 'arangodb/arangodb';

export type DbContextDbConfig = Config & {
  dockerImage?: string,
  port?: number,
  rootPassword?: string | false
};

export interface DbContext {
  dbContainer: Docker.Container
  dbConfig: DbContextDbConfig
}

const containers = new Set()
const docker = new Docker({ socketPath: '/var/run/docker.sock' })

export async function imageExists (imageName: string) {
  try {
    await execa('docker', ['image', 'inspect', imageName], { stdio: 'ignore' })
    return true
  } catch (err) {
    // @TODO this is fragile, but dockerode is being a PIA
    return false
  }
}

export async function purgeContainer (container: Docker.Container) {
  try {
    await container.kill()
  } finally {
    containers.delete(container)
    try {
      await container.remove({ force: true })
    } catch (err: unknown) {
      if (err instanceof Error) {
        // if 404, we probably used the --rm flag on container launch. it's all good.
        if (!('statusCode' in err) || (err.statusCode !== 404 && err.statusCode !== 409)) throw err
      }
    }
  }
}

export const container = {
  async setup<C> (
    ctx: C & DbContext,
    userDbConfig?: Partial<DbContextDbConfig>,
    dockerodeConfig?: Partial<Docker.ContainerCreateOptions>
  ): Promise<void> {
    const image = userDbConfig?.dockerImage ?? DEFAULT_DB_IMAGE;
    const port = await getPort( { port: userDbConfig?.port ?? 8529 });

    if (!await imageExists(DEFAULT_DB_IMAGE)) {
      await execa('docker', ['pull', image])
    }

    const rootPass = userDbConfig?.rootPassword ?? false;
    
    const container = await docker.createContainer(merge(
      {
        Image: image,
        ExposedPorts: { '8529/tcp': {} },
        Env: rootPass ? [`ARANGO_ROOT_PASSWORD=${rootPass}`] : ['ARANGO_NO_AUTH=1'],
        HostConfig: {
          AutoRemove: true,
          PortBindings: { '8529/tcp': [{ HostPort: port.toString() }] }
        }
      },
      dockerodeConfig || {}
    ));

    await container.start()
    containers.add(container)
    ctx.dbContainer = container
    const dbConfig: Partial<DbContextDbConfig> = { port, ...userDbConfig }; // Need to add defaults here

    ctx.dbConfig = dbConfig as DbContextDbConfig
    process.on('exit', () => this.teardown(ctx))
  },

  async teardown (ctx: DbContext) {
    const container: Docker.Container = ctx.dbContainer
    if (!container) {
      throw new Error('attempted to kill container, but missing from context')
    }
    await purgeContainer(container)
  }
}